/**
 * @author Kuitos
 * @since 2019-10-21
 */
import { Freer } from '../interfaces';

const rawHtmlAppendChild = HTMLHeadElement.prototype.appendChild;

export default function hijack(bootstrapping = false): Freer {
  let dynamicStyleSheets: HTMLLinkElement[] = [];
  HTMLHeadElement.prototype.appendChild = function appendChild<T extends Node>(this: any, newChild: T) {
    // hijack dynamic style injection
    if ((newChild as any).tagName && ((newChild as any).tagName === 'LINK' || (newChild as any).tagName === 'STYLE')) {
      dynamicStyleSheets.push(newChild as any);
    }

    return rawHtmlAppendChild.call(this, newChild) as T;
  };

  return function free() {
    HTMLHeadElement.prototype.appendChild = rawHtmlAppendChild;
    dynamicStyleSheets.forEach(stylesheet => document.head.removeChild(stylesheet));

    return function rebuild() {
      dynamicStyleSheets.forEach(stylesheet => document.head.appendChild(stylesheet));
      if (!bootstrapping) {
        // for gc
        dynamicStyleSheets = [];
      }
    };
  };
}
