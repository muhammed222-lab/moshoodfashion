//// filepath: /c:/Users/user/Desktop/mfh/app/components/cart.tsx
import React from "react";

export interface CartItemProps {
  id: string;
  name: string;
  category: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
  imageAlt?: string;
  onRemove: (id: string) => void;
  onIncrease: () => void;
  onDecrease: () => void;
  currencyFormatter: Intl.NumberFormat;
}

export const CartItem: React.FC<CartItemProps> = ({
  id,
  name,
  category,
  variant,
  quantity,
  price,
  image,
  imageAlt,
  onRemove,
  onIncrease,
  onDecrease,
  currencyFormatter,
}) => {
  return (
    <div className="flex items-center border-b pb-4">
      <img
        src={image}
        alt={imageAlt || name}
        className="w-20 h-20 object-cover rounded"
      />
      <div className="ml-4 flex-1">
        <h2 className="text-lg font-semibold">{name}</h2>
        <p className="text-gray-600">{category}</p>
        <p className="text-gray-600">Variant: {variant}</p>
        <div className="flex items-center mt-2">
          <button
            onClick={onDecrease}
            className="px-2 py-1 bg-gray-200 rounded"
          >
            -
          </button>
          <span className="mx-2">{quantity}</span>
          <button
            onClick={onIncrease}
            className="px-2 py-1 bg-gray-200 rounded"
          >
            +
          </button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">
          {currencyFormatter.format(price * quantity)}
        </p>
        <button
          onClick={() => onRemove(id)}
          className="text-red-500 text-sm mt-2"
        >
          Remove
        </button>
      </div>
    </div>
  );
};
