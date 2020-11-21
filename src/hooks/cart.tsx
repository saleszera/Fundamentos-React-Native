import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storagedProduct = await AsyncStorage.getItem(
        '@GoMarktplace:products',
      );

      if (storagedProduct) {
        setProducts([...JSON.parse(storagedProduct)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const productExist = products.find(item => item.id === product.id);

      const updateProducts = productExist
        ? products.map(item =>
            item.id === product.id
              ? { ...product, quantity: item.quantity + 1 }
              : item,
          )
        : [...products, { ...product, quantity: 1 }];

      setProducts(updateProducts);

      await AsyncStorage.setItem(
        '@GoMarktplace:products',
        JSON.stringify(updateProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const updateProducts = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      );

      setProducts(updateProducts);
      await AsyncStorage.setItem(
        '@GoMarktplace:products',
        JSON.stringify(updateProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const decrementProducts = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
      );

      const updateProducts = decrementProducts.filter(
        item => item.quantity >= 1,
      );

      setProducts(updateProducts);

      await AsyncStorage.setItem(
        '@GoMarktplace:products',
        JSON.stringify(updateProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
