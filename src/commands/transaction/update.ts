import { QuestionCollection } from "inquirer";
import { QuestionCommand } from "../../models";
import { pointsChangeValidator, requiredValidator } from "../../utils";
import { Argument, Option } from "commander";
import { mainApi, network } from "../../services";
import { ErrorResponse, RequestMethod, SuccessResponse } from "../../types";

enum UpdateChoices {
  title = "title",
  pointsChange = "change in points",
}

interface PromptAnswers {
  transactionId: string;
  updateChoices: UpdateChoices[];
  title?: string;
  pointsChange?: number;
}

const promptQuestions: QuestionCollection<PromptAnswers> = [
  {
    type: "input",
    name: "transactionId",
    // TODO Add validation for object IDs
    validate: requiredValidator,
  },
  {
    type: "checkbox",
    name: "updateChoices",
    message: "What fields would you like to update? (multiple select)",
    choices: Object.values(UpdateChoices),
    validate: requiredValidator,
  },
  {
    type: "input",
    name: "title",
    validate: requiredValidator,
    when: (answers) => {
      return answers.updateChoices.includes(UpdateChoices.title);
    },
  },
  {
    type: "number",
    name: "pointsChange",
    validate: pointsChangeValidator,
    when: (answers) => {
      return answers.updateChoices.includes(UpdateChoices.pointsChange);
    },
  },
];

export class UpdateCommand extends QuestionCommand<any> {
  name = "update";
  description = "update a transaction";
  aliases = ["change"];

  protected promptQuestions = promptQuestions;

  acceptArgs = [
    new Argument(
      "transactionId",
      "object id of the transaction to be updated"
    ).argOptional(),
  ];
  acceptOpts = [
    new Option("-t, --title <title>", "new title for the target transaction"),
    new Option("-p, --points <pointsChange>", "new value for change in points"),
  ];

  protected mapArgumentsToInputs(): void | Promise<void> {
    const userInput: Partial<PromptAnswers> = this.userInput || {};

    if (this.args.length) {
      userInput.transactionId = this.args[0];
    }

    this.userInput = userInput;
  }

  protected mapOptionsToInputs(): void | Promise<void> {
    const userInput: Partial<PromptAnswers> = this.userInput || {};
    const updateChoices: UpdateChoices[] = [];

    if (this.opts.title) {
      userInput.title = this.opts.title;
      updateChoices.push(UpdateChoices.title);
    }

    if (this.opts.pointsChange) {
      userInput.pointsChange = this.opts.pointsChange;
      updateChoices.push(UpdateChoices.pointsChange);
    }

    if (updateChoices.length) {
      // This will also mute the question for `updateChoices`.
      userInput.updateChoices = updateChoices;
    }
    this.userInput = userInput;
  }

  private async _sendRequest(): Promise<
    SuccessResponse | ErrorResponse | never
  > {
    if (!this.userInput?.transactionId) {
      console.error("[Error] Please specify a transaction ID.");
      // TODO Create a central error handler and a special type of error to
      //  indicate command termination. Add a method to `Command` to throw this
      //  new special error.
      throw new Error("No transaction ID");
    }

    return await network.request(mainApi, {
      uri: `/transactions/${this.userInput.transactionId}`,
      method: RequestMethod.PATCH,
      data: {
        ...this.userInput,
        transactionId: undefined,
      },
      description: `Update transaction ${this.userInput.transactionId}`,
    });
  }

  async run(): Promise<void> {
    this.mapArgumentsToInputs();
    this.mapOptionsToInputs();
    await this.promptForInputs();
    await this._sendRequest();
  }
}
