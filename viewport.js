'use strict';
// UI dimensions are independent of the 1440 x 810 world simulation.
window.dreamViewport = function ({ width, height, coarse, left = 0, right = 0, top = 0, bottom = 0 }) {
    const availableW = Math.max(1, width - (coarse ? 0 : left + right));
    const availableH = Math.max(1, height - (coarse ? 0 : top + bottom));
    const portrait = coarse && availableH > availableW;
    const compact = coarse || height < 530;
    const w = coarse ? availableW : Math.min(1440, availableW * (compact ? 1 : .96));
    const h = Math.max(1, availableH - (compact ? 0 : 86));
    const scale = portrait ? w / 1440 : Math.min(w / 1440, h / 810);
    const stageHeight = coarse ? h / scale : 810;
    const stageWidth = coarse && !portrait ? w / scale : 1440;
    return { scale, stageHeight, stageWidth, width: stageWidth * scale, height: stageHeight * scale,
        touchSize: 44 / scale, portrait, coarse };
};
