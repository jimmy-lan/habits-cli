/*
 * Construction and display methods for table.
 */

import Table from "cli-table3";
import chalk from "chalk";
import { ValueUpdateRowOptions } from "../../types";

const create = (options?: Partial<Table.TableConstructorOptions>) => {
  return new Table({
    style: { border: [], head: ["cyan"] },
    wordWrap: true,
    ...options,
  });
};

const createCompact = (options?: Partial<Table.TableConstructorOptions>) => {
  return create({
    chars: {
      top: "",
      "top-mid": "",
      "top-left": "",
      "top-right": "",
      bottom: "",
      "bottom-mid": "",
      "bottom-left": "",
      "bottom-right": "",
      left: "",
      "left-mid": "",
      mid: "",
      "mid-mid": "",
      right: "",
      "right-mid": "",
      middle: " ",
    },
    ...options,
  });
};

/**
 * Push a standard value-update row to `table`. A value-update row indicates
 * to the user on how the value of a field changes.
 *
 * @param table The table to work with.
 * @param rowTitle The title of the value-update row. This is usually set to
 *  the specific field being updated.
 * @param oldValue Old value of the field.
 * @param newValue New value of the field.
 * @param options
 */
const pushValueUpdateRow = (
  table: Table.Table,
  rowTitle: string,
  oldValue: any,
  newValue: any,
  options?: Partial<ValueUpdateRowOptions>
) => {
  if (oldValue === newValue && !options?.disableEqValueWarning) {
    console.warn(
      `${chalk.bgYellow("WARN")} "${rowTitle}" already has value ${oldValue}.`
    );
  }
  if (oldValue !== newValue || options?.shouldIncludeEqValue) {
    table.push([`${rowTitle}:`, oldValue, "->", newValue]);
  }
};

const print = (table: Table.Table) => {
  console.log(table.toString());
};

export const table = { create, createCompact, pushValueUpdateRow, print };
