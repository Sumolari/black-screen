import {FileInfo} from "../../Interfaces";
import * as Path from "path";
import * as _ from "lodash";
import {Color} from "../../Enums";
import {normalizeDirectory} from "../../utils/Common";

type SuggestionType = "executable" | "command" | "option" | "option-value" | "branch" | "directory" | "file" | "alias";

export class Suggestion {
    protected _value = "";
    private _displayValue = "";
    private _synopsis = "";
    private _description = "";
    private _type = "";
    private _prefix = "";
    private _debugTag = "";

    get value(): string {
        return this._value;
    }

    get synopsis(): string {
        return this._synopsis || this.truncatedDescription;
    }

    get description(): string {
        return this._description;
    }

    get type(): string {
        return this._type;
    }

    get prefix(): string {
        return this._prefix;
    }

    get iconColor(): Color {
        return Color.White;
    }

    get displayValue(): string {
        return this._displayValue || this.value;
    }

    get debugTag(): string {
        return this._debugTag;
    }

    withValue(value: string): this {
        this._value = value;
        return this;
    }

    withDisplayValue(value: string): this {
        this._displayValue = value;
        return this;
    }

    withSynopsis(synopsis: string): this {
        this._synopsis = synopsis;
        return this;
    }

    withDescription(description: string): this {
        this._description = description;
        return this;
    }

    withType(type: string): this {
        this._type = type;
        return this;
    }

    withPrefix(prefix: string): this {
        this._prefix = prefix;
        return this;
    }

    withDebugTag(tag: string): this {
        this._debugTag = tag;
        return this;
    }

    private get truncatedDescription(): string {
        return _.truncate(this.description, {length: 50, separator: " "});
    }
}

export const type = (value: SuggestionType) => <T extends Suggestion>(suggestion: T) => suggestion.withType(value);
export const command = type("command");
export const description = (value: string) => <T extends Suggestion>(suggestion: T) => suggestion.withDescription(value);

abstract class BaseOption extends Suggestion {
    get type() {
        return "option";
    }
}

export class Option extends BaseOption {
    private _alias: string;

    constructor(protected _name: string) {
        super();
    };

    get value() {
        return `--${this._name}`;
    }

    get displayValue() {
        return `${this.alias} ${this.value}`;
    }

    private get alias(): string {
        return `-${this._alias || this._name[0]}`;
    }
}

export class ShortOption extends BaseOption {
    constructor(protected _name: string) {
        super();
    };

    get value() {
        return `-${this._name}`;
    }
}

export class Executable extends Suggestion {
    constructor(protected _name: string) {
        super();
    };

    get value() {
        return this._name;
    }

    get displayValue() {
        return this._name;
    }

    get type() {
        return "executable";
    }
}

export class File extends Suggestion {
    constructor(protected _info: FileInfo, protected relativeSearchDirectory: string) {
        super();
    };

    get value() {
        return this.escape(Path.join(this.relativeSearchDirectory, this.unescapedFileName));
    }

    get displayValue() {
        return this.unescapedFileName;
    }

    get type() {
        return ["file", this.extension].join(" ");
    }

    get partial() {
        return this._info.stat.isDirectory();
    }

    get info(): FileInfo {
        return this._info;
    }

    private escape(path: string): string {
        return path.replace(/\s/g, "\\ ");
    }

    private get unescapedFileName(): string {
        if (this._info.stat.isDirectory()) {
            return normalizeDirectory(this._info.name);
        } else {
            return this._info.name;
        }
    }

    private get extension(): string {
        if (this._info.stat.isDirectory()) {
            return "directory";
        }

        let extension = Path.extname(this.unescapedFileName);
        if (extension) {
            return extension.slice(1);
        } else {
            return "unknown";
        }
    }
}
