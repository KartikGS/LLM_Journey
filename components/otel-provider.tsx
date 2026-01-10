'use client';

import { useEffect, useRef } from 'react';

export function OtelProvider({ children }: { children: React.ReactNode }) {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        import('../lib/otel/client').then(({ initOtel }) => {
            initOtel();
        });
    }, []);

    return <>{children}</>;
}
