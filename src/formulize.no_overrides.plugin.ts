import { defaultOptions } from './option.value';
import { FormulizeFunction, FormulizeOptions } from './formulize.interface';
import { UI } from './ui/ui';
import { FormulizePlugin } from './formulize.jquery';

export function pluginBinder() {
    $.fn.formulize = <FormulizePlugin>Object.assign<FormulizeFunction, FormulizeOptions>(
        function (this: JQuery, options: FormulizeOptions): JQuery {
            this
                .toArray()
                .forEach(elem => {
                    $(elem).data('$formulize', new UI(elem, options));
                });
            return this;
        },
        <FormulizeOptions>{ ...defaultOptions }
    );
}
