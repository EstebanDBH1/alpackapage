import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
    const baseClasses = "bg-gray-200 animate-pulse";

    let variantClasses = "";
    if (variant === 'circle') {
        variantClasses = "rounded-full";
    } else if (variant === 'text') {
        variantClasses = "rounded h-4 w-full";
    } else {
        variantClasses = "rounded-none"; // Rectangular for brutalist look
    }

    return (
        <div className={`${baseClasses} ${variantClasses} ${className}`} />
    );
};

export default Skeleton;
