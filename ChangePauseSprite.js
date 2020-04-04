//=============================================================================
// ChangePauseSprite.js
// ----------------------------------------------------------------------------
// (C)2019-2020 linkscape
// 
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2019/11/23 誰にも知られることなく完成
//
//=============================================================================

/*:
 * @plugindesc SVG操作プラグイン
 * @author linkscape
 *
 * @help ChangePauseSprite.js
 * pause画像データをsystemに入れてください。
 *
 */

(function() {
    'use strict';

    
    Window.prototype._refreshPauseSign = function() {
        var sx = 144;
        var sy = 96;
        var p = 24;
        this._windowPauseSignSprite.bitmap = ImageManager.loadSystem('pause');
        this._windowPauseSignSprite.anchor.x = 0.5;
        this._windowPauseSignSprite.anchor.y = 0.5;
        this._windowPauseSignSprite.move(this._width * 0.95, this._height*0.8);
        this._windowPauseSignSprite.alpha = 0;
    };

    Window.prototype._updatePauseSign = function() {
        var sprite = this._windowPauseSignSprite;
        var x = Math.floor(this._animationCount / 16) % 2;
        var y = Math.floor(this._animationCount / 16 / 2) % 2;
        var sx = 144;
        var sy = 96;
        var p = 24;
        if (!this.pause) {
            sprite.alpha = 0;
        } else {
            sprite.alpha = 1;
            sprite.y = this._height*0.8 + 5*Math.sin(this._animationCount/8)
        }
        sprite.visible = this.isOpen();
    };

    
})();
