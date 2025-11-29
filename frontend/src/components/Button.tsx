import type React from "react";

interface ButtonProps extends React.ComponentProps<"button"> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, ...rest }) => {
  return (
    <button
      {...rest}
      className="rounded-md text-center bg-emerald-900 text-white px-3 py-1 cursor-pointer"
    >
      {children}
    </button>
  );
};

export default Button;
