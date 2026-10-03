import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <defs>
                <linearGradient id="waGradient" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#25D366" />
                    <stop offset="1" stopColor="#075E54" />
                </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#waGradient)" />
            <path
                d="M16 6C10.48 6 6 10.48 6 16C6 17.85 6.5 19.58 7.37 21.07L6 26L11.08 24.67C12.52 25.51 14.2 26 16 26C21.52 26 26 21.52 26 16C26 10.48 21.52 6 16 6Z"
                fill="white"
                fillOpacity="0.2"
            />
            {/* Blast bolt / zap in center */}
            <path
                d="M17.5 9L11 17H16L14.5 23L21 15H16L17.5 9Z"
                fill="white"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
