type ButtonProps = {
  handlerFunction: () => {};
  variant: "Default" | "Custom";
  title: string;
};

export const Button = ({
  handlerFunction,
  title,
  variant = "Default",
}: ButtonProps) => {
  const styling = variant === "Default" ? "" : "";
  return (
    <button onClick={handlerFunction} className={styling}>
      {title}
    </button>
  );
};
