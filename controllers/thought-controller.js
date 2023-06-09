const { Thought, User } = require("../models");

const thoughtController = {
  // get all Thoughts
  getAllThought(req, res) {
    Thought.find({})
      .populate({
        path: "reactions",
        //https://kb.objectrocket.com/mongo-db/understanding-the-mongoose-__v-field-1011
        select: "-__v",
      })
      .select("-__v")
      .sort({ _id: -1 })
      .then((databaseThoughtData) => res.json(databaseThoughtData))
      .catch((err) => {
        console.log(err);
        res.sendStatus(400);
      });
  },

  // get one Thought by id
  getThoughtById({ params }, res) {
    Thought.findOne({ _id: params.id })
      .populate({
        path: "reactions",
        select: "-__v",
      })
      .select("-__v")
      .then((databaseThoughtData) => {
        //if no match
        if (!databaseThoughtData) {
          return res.status(404).json({ message: "No thought with this id!" });
        }
        res.json(databaseThoughtData);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(400);
      });
  },

  // create Thought
  // push the created thought's _id to the associated user's thoughts array field
  createThought({ params, body }, res) {
    console.log(res)
    Thought.create(body).then(({ _id }) => {
      console.log(1)
        return User.findOneAndUpdate(
          { _id: body.userId },
          { $push: { thoughts: _id } },
          { new: true }
        );
      })
      .then((databaseUserData) => {
        console.log(databaseUserData)
        // can't find the users id
        if (!databaseUserData) {
          return res
            .status(404)
            .json({ message: "Thought created but no user with this id!" });
        }

        res.json({ message: "Thought successfully created!" });
      })
      .catch((err) => {
        console.log("reach")
return res.json(err)
      });
  },

  // update Thought by id
  updateThought({ params, body }, res) {
    Thought.findOneAndUpdate(
      { _id: params.id }, 
      {$set: body}, 
      {
      new: true,
      runValidators: true,
    })
      .then((databaseThoughtData) => {
        if (!databaseThoughtData) {
          res.status(404).json({ message: "No thought found with this id!" });
          return;
        }
        res.json(databaseThoughtData);
      })
      .catch((err) => res.json(err));
  },

  // delete Thought
  deleteThought({ params }, res) {
    Thought.findOneAndDelete({ _id: params.id })
      .then((databaseThoughtData) => {
        if (!databaseThoughtData) {
          return res.status(404).json({ message: "No thought with this id!" });
        }

        // remove thought id from user's `thoughts` field
        return User.findOneAndUpdate(
          { thoughts: params.id },
          { $pull: { thoughts: params.id } }, //$pull removes from an existing values that match a specified condition.
          { new: true }
        );
      })
      .then((databaseUserData) => {
        if (!databaseUserData) {
          return res
            .status(404)
            .json({ message: "Thought created but no user with this id!" });
        }
        res.json({ message: "Thought successfully deleted!" });
      })
      .catch((err) => res.json(err));
  },

  // add reaction
  addReaction({ params, body }, res) {
    Thought.findOneAndUpdate(
      { _id: params.thoughtId },
      { $addToSet: { reactions: body } },
      { new: true, runValidators: true }
    )
      .then((databaseThoughtData) => {
        if (!databaseThoughtData) {
          res.status(404).json({ message: "No thought with this id" });
          return;
        }
        res.json(databaseThoughtData);
      })
      .catch((err) => res.json(err));
  },

  // delete reaction
  removeReaction({ params }, res) {
    Thought.findOneAndUpdate(
      { _id: params.thoughtId },
      { $pull: { reactions: { reactionId: params.reactionId } } },
      { new: true }
    )
      .then((databaseThoughtData) => res.json(databaseThoughtData))
      .catch((err) => res.json(err));
  },
};

module.exports = thoughtController;
