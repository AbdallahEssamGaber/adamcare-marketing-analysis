export default function Skeleton({ width, height, radius = 4, style }) {
  return (
    <span
      className="skeleton"
      style={{
        width: width,
        height: height,
        borderRadius: radius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
