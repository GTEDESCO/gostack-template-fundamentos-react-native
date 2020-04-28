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
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (productsStorage) {
        setProducts(JSON.parse(productsStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productExists = products.find(
        productFinder => productFinder.id === product.id,
      );

      if (productExists) {
        const updatedProducts = products.map(productMap => {
          let { quantity } = productMap;
          if (productMap.id === productExists.id) {
            quantity += 1;
          }

          return {
            ...productMap,
            quantity,
          };
        });

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(updatedProducts),
        );

        setProducts(updatedProducts);

        return;
      }

      const newProducts = [...products, product];

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );

      setProducts(newProducts);
    },
    [products],
  );

  const increment = useCallback(
    async (id: string) => {
      const productExists = products.find(
        productFinder => productFinder.id === id,
      );

      if (productExists) {
        const updatedProducts = products.map(productMap => {
          let { quantity } = productMap;
          if (productMap.id === productExists.id) {
            quantity += 1;
          }

          return {
            ...productMap,
            quantity,
          };
        });

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(updatedProducts),
        );

        setProducts(updatedProducts);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async (id: string) => {
      const productExists = products.find(
        productFinder => productFinder.id === id,
      );

      if (productExists) {
        const updatedProducts = products
          .map(productMap => {
            let { quantity } = productMap;
            if (productMap.id === productExists.id) {
              quantity -= 1;
            }

            return {
              ...productMap,
              quantity,
            };
          })
          .filter(productFilter => productFilter.quantity > 0);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(updatedProducts),
        );

        setProducts(updatedProducts);
      }
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
