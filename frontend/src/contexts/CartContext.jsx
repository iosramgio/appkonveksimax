import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { calculatePriceBreakdown } from '../utils/pricingCalculator';

export const CartContext = createContext();

const initialState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  total: 0,
  loading: false
};

const loadCartFromStorage = (userId) => {
  try {
    const savedCart = localStorage.getItem(`cart_${userId}`);
    return savedCart ? JSON.parse(savedCart) : initialState;
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return initialState;
  }
};

const calculateDozenDistribution = (items) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalDozens = Math.floor(totalQuantity / 12);
  const totalDozenQuantity = totalDozens * 12;
  
  // Sort items by additional price (ascending)
  const sortedItems = [...items].sort((a, b) => 
    (a.additionalPrice || 0) - (b.additionalPrice || 0)
  );
  
  let dozenDistribution = [];
  let unitDistribution = [];
  let remainingDozenQty = totalDozenQuantity;
  
  // Distribute dozens starting from cheaper sizes
  for (const item of sortedItems) {
    if (remainingDozenQty > 0) {
      const dozenQty = Math.min(item.quantity, remainingDozenQty);
      const unitQty = item.quantity - dozenQty;
      
      if (dozenQty > 0) {
        dozenDistribution.push({
          ...item,
          quantity: dozenQty,
          priceType: 'dozen'
        });
      }
      
      if (unitQty > 0) {
        unitDistribution.push({
          ...item,
          quantity: unitQty,
          priceType: 'unit'
        });
      }
      
      remainingDozenQty -= dozenQty;
    } else {
      unitDistribution.push({
        ...item,
        priceType: 'unit'
      });
    }
  }
  
  return [...dozenDistribution, ...unitDistribution];
};

const calculateItemPrice = (size, quantity, basePrice, dozenPrice, materialAdditionalPrice = 0) => {
  const pricePerUnit = basePrice + (size.additionalPrice || 0) + materialAdditionalPrice;
  const dozenPricePerUnit = (dozenPrice / 12) + (size.additionalPrice || 0) + materialAdditionalPrice;
  
  // Round to nearest integer to avoid floating point issues
  return Math.round(pricePerUnit * quantity);
};

const recalculateCart = async (items) => {
  let cartTotal = 0;
  let totalItems = 0;

  const processedItems = items.map(item => {
    // Calculate total quantity
    const totalQuantity = item.sizeBreakdown.reduce((sum, size) => sum + size.quantity, 0);
    totalItems += totalQuantity;

    // Use the standardized pricing calculator - konsisten dengan ProductDetail.jsx
    const priceDetails = calculatePriceBreakdown({
      sizeBreakdown: item.sizeBreakdown,
      product: {
        basePrice: item.basePrice,
        dozenPrice: item.dozenPrice,
        discount: item.discount || 0,
        customizationFee: item.customDesign?.customizationFee || 0
      },
      material: item.material,
      customDesign: item.customDesign && item.customDesign.isCustom ? { 
        isCustom: true,
        customizationFee: item.customDesign?.customizationFee || 0
      } : null
    });

    cartTotal += priceDetails.total;

    return {
      ...item,
      priceDetails: priceDetails // Gunakan format priceDetails yang lengkap, konsisten dengan ProductDetail.jsx
    };
  });

  return {
    items: processedItems,
    totalItems,
    subtotal: cartTotal,
    total: cartTotal
  };
};

const cartReducer = async (state, action) => {
  let newState;
  
  switch (action.type) {
    case 'SET_CART': {
      return {
        ...state,
        ...action.payload,
        loading: false
      };
    }
    
    case 'ADD_TO_CART': {
      const { item } = action.payload;
      
      if (!item.productId || !item.sizeBreakdown || !item.material) {
        console.error('Invalid cart item:', item);
        return state;
      }
      
      // Use the consistent pricing calculator
      const priceDetails = calculatePriceBreakdown({
        sizeBreakdown: item.sizeBreakdown,
        product: {
          basePrice: item.basePrice,
          dozenPrice: item.dozenPrice,
          discount: item.discount || 0,
          customizationFee: item.customDesign?.customizationFee || 0
        },
        material: item.material,
        customDesign: item.customDesign && item.customDesign.isCustom ? { 
          isCustom: true,
          customizationFee: item.customDesign?.customizationFee || 0
        } : null
      });
      
      // Create cart item with updated price details
      const cartItem = {
        ...item,
        priceDetails: priceDetails // Format priceDetails konsisten
      };
      
      // Update cart state
      const existingItemIndex = state.items.findIndex(
        i => i.productId === item.productId
      );
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = cartItem;
        const recalculatedState = await recalculateCart(updatedItems);
        newState = { ...state, ...recalculatedState };
      } else {
        const updatedItems = [...state.items, cartItem];
        const recalculatedState = await recalculateCart(updatedItems);
        newState = { ...state, ...recalculatedState };
      }
      break;
    }
    
    case 'REMOVE_FROM_CART': {
      const updatedItems = state.items.filter(item => item._id !== action.payload);
      const recalculatedState = await recalculateCart(updatedItems);
      newState = { ...state, ...recalculatedState };
      break;
    }
    
    case 'UPDATE_CART_ITEM': {
      const { itemId, updates } = action.payload;
      const updatedItems = state.items.map(item => {
        if (item._id === itemId) {
          return { ...item, ...updates };
        }
        return item;
      });
      const recalculatedState = await recalculateCart(updatedItems);
      newState = { ...state, ...recalculatedState };
      break;
    }
    
    case 'CLEAR_CART':
      newState = initialState;
      break;
    
    case 'SET_CART_LOADING':
      newState = { ...state, loading: action.payload };
      break;
    
    default:
      newState = state;
  }
  
  return newState;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [state, setState] = useState(initialState);
  const prevUserRef = useRef(null);

  // Load cart when user logs in or changes
  useEffect(() => {
    if (isAuthenticated && user && user._id !== prevUserRef.current) {
      const userCart = loadCartFromStorage(user._id);
      setState(userCart);
      prevUserRef.current = user._id;
    } else if (!isAuthenticated) {
      setState(initialState);
      prevUserRef.current = null;
    }
  }, [isAuthenticated, user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isAuthenticated && user && state !== initialState) {
      localStorage.setItem(`cart_${user._id}`, JSON.stringify(state));
    }
  }, [state, isAuthenticated, user]);

  // Dispatch function to handle async reducer
  const dispatch = async (action) => {
    setState(prevState => ({ ...prevState, loading: true }));
    try {
      const newState = await cartReducer(state, action);
      setState(newState);
    } catch (error) {
      console.error('Error in cart reducer:', error);
    } finally {
      setState(prevState => ({ ...prevState, loading: false }));
    }
  };

  const addToCart = (item) => {
    dispatch({ type: 'ADD_TO_CART', payload: { item } });
  };

  const removeFromCart = (itemId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const updateCartItem = (itemId, updates) => {
    dispatch({ type: 'UPDATE_CART_ITEM', payload: { itemId, updates } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};