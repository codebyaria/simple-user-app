import Image from 'next/image';
import Link from 'next/link';
import LogoBrand from "@/public/assets/logo/logo-brand.png";


export default function NavLogoBrand() {
    return (
        <Link
            href="/customers"
            className="flex items-center gap-2"
        >
            <Image
                src={LogoBrand}
                alt="Logo Customer Management App"
                width={40}
                height={40}
            />
        </Link>
    );
}
