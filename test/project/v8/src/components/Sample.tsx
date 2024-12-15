export const Sample = ({
  background,
  children,
  color,
  outlineColor = 'transparent',
  size = 16,
}: {
  background?: string;
  children: string;
  color?: string;
  outlineColor?: string;
  size?: number;
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        padding: 8,
        borderRadius: 8,
        fontFamily: 'sans-serif',
        border: '2px solid',
        backgroundColor: background,
        borderColor: outlineColor,
        color,
        fontSize: size,
      }}
    >
      {children}
    </div>
  );
};
