import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 14,
                    background: 'linear-gradient(to bottom right, #8b5cf6, #3b82f6)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    position: 'relative',
                }}
            >
                {/* Top-left accent */}
                <div
                    style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        width: '12px',
                        height: '12px',
                        background: 'rgba(16, 185, 129, 0.6)', // accent-green/60
                        borderRadius: '2px',
                    }}
                />
                {/* Bottom-right accent */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        width: '10px',
                        height: '10px',
                        background: 'rgba(236, 72, 153, 0.6)', // accent-pink/60
                        borderRadius: '2px',
                    }}
                />
                BF
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
