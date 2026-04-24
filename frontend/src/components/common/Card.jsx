export default function Card({ children, className = '', onClick, brand = false }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-[#F0E8E5] p-6 ${brand ? 'border-l-[3px] border-l-secondary' : ''} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
