export async function preloadImages(urls: string[]): Promise<void> {
  await Promise.all(
    [...new Set(urls)].map(
      (url) =>
        new Promise<void>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve();
          image.onerror = () => reject(new Error(`Failed to preload ${url}`));
          image.src = url;
        }),
    ),
  );
}
