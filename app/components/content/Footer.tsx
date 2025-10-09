import Image from "next/image";

const Footer = () => {
  return (
    <div className="px-4 py-3">
      <div className="flex justify-center mb-3">
        <div className="w-3/4 h-px bg-[#e1e3e5]"></div>
      </div>
      <div className="flex items-center justify-center">
        <Image
          src="/logo-escudo.png"
          alt="Escudo Municipal"
          width={32}
          height={32}
          className="mr-2 w-auto"
        />
        <span className="text-lg font-semibold text-gray-600">
          Municipalidad El Quisco
        </span>
      </div>
    </div>
  );
};

export default Footer;
