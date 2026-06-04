"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::rating.rating", ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("You must be logged in");
    }

    const { score, book } = ctx.request.body.data;

    const rating = await strapi.entityService.create("api::rating.rating", {
      data: {
        score,
        book,
        user: user.id,
        publishedAt: new Date(),
      },
      populate: ["book", "user"],
    });

    return { data: rating };
  },

  async find(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("You must be logged in");
    }

    const ratings = await strapi.entityService.findMany("api::rating.rating", {
      filters: {
        user: user.id,
      },
      populate: {
        book: {
          populate: ["coverImage"],
        },
        user: true,
      },
    });

    return { data: ratings };
  },
}));
