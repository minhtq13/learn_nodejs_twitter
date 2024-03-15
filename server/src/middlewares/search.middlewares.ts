import { checkSchema } from "express-validator";
import { MediaTypeQuery, PeopleFollow } from "~/constants/enums";
import { validate } from "~/utils/validation";

export const searchValidator = validate(
  checkSchema(
    {
      content: {
        isString: {
          errorMessage: "Content must be a string",
        },
      },
      media_type: {
        optional: true,
        isIn: {
          options: [Object.values(MediaTypeQuery)],
        },
        errorMessage: `Media type must be one of [${Object.values(MediaTypeQuery)}]`,
      },
      people_follow: {
        optional: true,
        isIn: {
          options: [Object.values(PeopleFollow)],
          errorMessage: "People follow must be one of [0, 1]",
        },
      },
    },
    ["query"],
  ),
);
