import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import Image from "next/image";

interface PhoneProps extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string;
  dark?: boolean;
}

const Phone = ({ imgSrc, className, dark = false, ...props }: PhoneProps) => {
  return (
    <div
      className={cn(
        "relative pointer-events-none z-50 overflow-hidden",
        className
      )}
      {...props}
    >
      <Image
        width={400}
        height={800}
        src={
          dark
            ? "/images/phone-template-dark-edges.png"
            : "/images/phone-template-white-edges.png"
        }
        alt="phone image"
        className="pointer-events-none z-50 select-none"
      />

      <div className="absolute -z-10 inset-0">
        <Image
          width={400}
          height={800}
          src={imgSrc}
          alt="pverlaying phone image"
          className="object-cover"
        />
      </div>
    </div>
  );
};

export default Phone;
