import React, { useRef, useState, ReactNode } from 'react';
import Lottie, { LottieRefCurrentProps, LottieComponentProps } from 'lottie-react';
import NeoButton from '@/components/neo-components/NeoButton';
import { cn } from '@/lib/utils';

export interface AnimateLottieProps extends Omit<LottieComponentProps, 'lottieRef'> {
    children?: ReactNode;
    trigger?: 'hover' | 'tap' | 'both';
    containerClassName?: string;
    containerStyle?: React.CSSProperties;
    playOnce?: boolean; // If true, animation won't reverse
    reverseOnExit?: boolean; // If false, animation stays at end state
}

/**
 * AnimateLottie - A wrapper component for Lottie animations
 * Plays animation on hover/tap and can reverse when interaction ends
 * 
 * @param trigger - 'hover', 'tap', or 'both' (default: 'hover')
 * @param playOnce - If true, animation plays once and doesn't reverse
 * @param reverseOnExit - If false, animation stays at end state (default: true)
 * @param children - Optional content to display alongside animation
 * @param containerClassName - CSS class for the wrapper container
 * @param containerStyle - Inline styles for the wrapper container
 * @param ...lottieProps - All standard lottie-react props (animationData, loop, etc.)
 */
export const AnimateLottie: React.FC<AnimateLottieProps> = ({
    children,
    trigger = 'hover',
    containerStyle = {},
    playOnce = false,
    reverseOnExit = true,
    ...lottieProps
}) => {
    const lottieRef = useRef<LottieRefCurrentProps>(null);
    const [isActive, setIsActive] = useState(false);

    const handleInteractionStart = () => {
        if (!lottieRef.current) return;

        setIsActive(true);
        lottieRef.current.setDirection(1);
        lottieRef.current.play();
    };

    const handleInteractionEnd = () => {
        if (!lottieRef.current || playOnce || !reverseOnExit) return;

        setIsActive(false);
        lottieRef.current.setDirection(-1);
        lottieRef.current.play();
    };

    const shouldHandleHover = trigger === 'hover' || trigger === 'both';
    const shouldHandleTap = trigger === 'tap' || trigger === 'both';

    const interactionProps = {
        ...(shouldHandleHover && {
            onMouseEnter: handleInteractionStart,
            onMouseLeave: handleInteractionEnd,
        }),
        ...(shouldHandleTap && {
            onClick: isActive ? handleInteractionEnd : handleInteractionStart,
        }),
    };

    return (
        <div
            style={{
                cursor: shouldHandleTap ? 'pointer' : 'default',
                ...containerStyle,
            }}
            {...interactionProps}
        >
            <Lottie
                lottieRef={lottieRef}
                {...lottieProps}
            />
            {children}
        </div>
    );
};