export default function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-[#F0E8E5] p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
