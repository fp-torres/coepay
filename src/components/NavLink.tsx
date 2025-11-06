import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CustomNavLinkProps extends NavLinkProps {
  activeClassName?: string;
}

export function NavLink({ className, activeClassName, ...props }: CustomNavLinkProps) {
  return (
    <RouterNavLink
      {...props}
      className={(navData) =>
        cn(
          typeof className === "function" ? className(navData) : className,
          navData.isActive && activeClassName
        )
      }
    />
  );
}
