import React from 'react';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import type { AvatarConfig } from '../avatar/avatar-types';

type AvatarOptionCardProps = {
  label: string;
  selected: boolean;
  previewConfig: AvatarConfig;
  onSelect: () => void;
};

export function AvatarOptionCard({
  label,
  selected,
  previewConfig,
  onSelect,
}: AvatarOptionCardProps) {
  return (
    <button
      type="button"
      className={`game-card game-focus ${selected ? 'is-selected' : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <div style={{ aspectRatio: '2 / 3', minHeight: 220 }}>
        <AvatarRenderer
          config={previewConfig}
          alt={`${label}预览`}
        />
      </div>
      <div>{label}</div>
      {selected ? (
        <span
          className="game-selected-badge selection-badge-enter"
          aria-label="已选择"
        >
          ✓
        </span>
      ) : null}
    </button>
  );
}
