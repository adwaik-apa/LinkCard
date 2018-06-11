/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    "use strict";
    export class Visual implements IVisual {
        private host:IVisualHost;
        private target: HTMLElement;
        private settings: VisualSettings;
        private linkElement:HTMLElement;

        private linkColor:string;
        private linkHoverColor:string;
        private link:string;
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.target = options.element;
            this.target.setAttribute("display","block");

            //Create HTML Element to Hold the [Link]
            this.linkElement = this.createLinkElement();

            //Append Created Element to the Target [Main View]
            this.target.appendChild(this.linkElement);
            
        }

        private createLinkElement():HTMLElement{
            var element = document.createElement('a');

            element.addEventListener('click',()=>{
                //Open the Link:
                //You Should Use host.launchUrl API, Other Methods will not work without pressing the CTRL Key
                //This Will open a window for the User , Asking for Allow Navigation
                if(this.link != null && this.link != '')
                    this.host.launchUrl(this.link);
            });

            element.addEventListener('mouseenter',()=>{
                //Change Link Color When Mouse Enter : Hover Color
                this.linkElement.style.color = this.linkHoverColor;
            });

            element.addEventListener('mouseout',()=>{
                //Reset Link Color When Mouse Leav : Default Link Color
                this.linkElement.style.color = this.linkColor;
            });

            return element;
        }

        public update(options: VisualUpdateOptions) {
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            
            if(!options.dataViews || !options.dataViews[0] || !options.dataViews[0].single || !options.dataViews[0].single.value)
            {
                //nothing provided
                this.link = "";
            }
            else {
                //Update Link
                this.link = options.dataViews[0].single.value.toString();
            }

            //Update Element Properties:
            if(typeof this.linkElement != "undefined"){
                this.linkElement.textContent = this.settings.stylePoint.linkText;
                this.linkElement.title = this.settings.stylePoint.linkHint;
                this.linkElement.style.fontSize = this.settings.stylePoint.fontSize+"px";
                this.linkElement.style.textDecoration = this.settings.stylePoint.underLine ? "underline":"none";
                this.linkElement.style.color = this.settings.stylePoint.linkColor;

                this.linkColor = this.settings.stylePoint.linkColor;
                this.linkHoverColor = this.settings.stylePoint.linkHoverColor;

                this.target.setAttribute("align",this.settings.stylePoint.alignment);
            }

            

            
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }
    }
}