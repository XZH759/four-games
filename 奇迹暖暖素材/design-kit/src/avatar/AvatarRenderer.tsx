import React, { useEffect, useMemo, useState } from 'react';
import { AVATAR_LAYER_ORDER, resolveAvatarLayers } from './avatar-manifest';
import type { AvatarConfig } from './avatar-types';

type AvatarRendererProps = {
  config: AvatarConfig;
  className?: string;
  alt?: string;
};

function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = url;
        }),
    ),
  );
}

export function AvatarRenderer({
  config,
  className = '',
  alt = '当前角色预览',
}: AvatarRendererProps) {
  const nextLayers = useMemo(() => resolveAvatarLayers(config), [config]);
  const [visibleLayers, setVisibleLayers] = useState(nextLayers);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const urls = Object.values(nextLayers).filter(Boolean) as string[];

    preloadImages(urls).then(() => {
      if (cancelled) return;
      setEntering(true);
      requestAnimationFrame(() => {
        setVisibleLayers(nextLayers);
        requestAnimationFrame(() => setEntering(false));
      });
    });

    return () => {
      cancelled = true;
    };
  }, [nextLayers]);

  return (
    <div
      className={`avatar-stage ${className}`}
      role="img"
      aria-label={alt}
    >
      <div className={`avatar-stack ${entering ? 'is-entering' : ''}`}>
        {AVATAR_LAYER_ORDER.map((key) => {
          const src = visibleLayers[key];
          if (!src) return null;
          return (
            <img
              key={`${key}-${src}`}
              className={`avatar-layer avatar-layer--${key}`}
              src={src}
              alt=""
              aria-hidden="true"
              draggable={false}
            />
          );
        })}
      </div>
    </div>
  );
}
