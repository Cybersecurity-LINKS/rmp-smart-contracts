import {Navbar, NavbarBrand, Link} from "@heroui/react";
import {Link as RouterLink} from 'react-router-dom';


export const Layout = ({children}: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <MainNavbar/>
            <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 flex-grow">
                {children}
            </main>
            <Footer/>
        </div>
    );
};

const MainNavbar = () => {

    return (
        <Navbar
            className="bg-white border-b border-default-200 justify-start"
            maxWidth="lg"
            position="sticky"
            isBordered
        >
            <div className="container mx-auto flex items-center justify-between">
                {/* Logo */}
                <NavbarBrand className="flex-none">
                    <RouterLink to="/" className="font-bold text-xl text-primary-500">
                        Raw Material Passport (RMP)
                    </RouterLink>
                </NavbarBrand>
            </div>
        </Navbar>
    );
};

const Footer = () => {
    return (
        <footer className="bg-default-50 border-t border-default-200 text-default-700 py-8 mt-auto">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <span className="font-medium text-primary-500">NFT Minter</span>
                        <span className="mx-2 text-default-400">|</span>
                        <span className="text-sm text-default-500">Create your materials' NFT</span>
                    </div>
                    <div className="text-sm text-default-500">
            <span>
              Powered by&nbsp;
                <Link className="text-sm" href="https://github.com/Cybersecurity-LINKS">
                Cybersecurity Research Group @ LINKS Foundation
              </Link>
            </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};


