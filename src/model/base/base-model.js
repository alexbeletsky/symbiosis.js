//Static methods!?
export class BaseModel {

  constructor(definition, adapter) {
    //Register instances adapter, properties etc.
    this.definition = definition;
    this.__context = []; //Use some ES6 data structure more suited?
  }

  create(data) {
    return new ModelInstance(data, this);
  }

  //TODO: Person.get(ID);
  //TODO: Person.find({name: 'Something'});
  // Returns promise that eventually should resolve into a person with proxies to the persons friends and projects
  // (or the populated data if it already is fetched somewhere else in the application
  //TODO: Person.find(/*...*/).populate('friends', 'projects');
  // Returns promise that eventually resolves into a person with its associated friends and projects populated

}

class ModelInstance {

  constructor(data, context) {
    this.context = context;

    this.fields = context.definition.fields;
    this.computedValues = context.definition.computedValues;
    this.serializationHandlers = context.definition.serializationHandlers;

    this.set(data);
  }

  remove() {
    //TODO: Interface with models adapter to tell it to remove instance
    this.__isRemoving = true;
    //TODO: Fire onRemove callbacks
    //Adapter should return a promise.
    // When resolved:
    // this.__removed = true
    // When rejeted:
    // Finally:
    // this.__isRemoving = false
  }

  //TODO: validate() {
  //returns an array of all fields, their isValid, and an optional message
  //Iterate over all properties
  //}

  //TODO: A computed value over validations state
  //person.validation.fields['age']
  //{
  //	errors: ['Field is required']
  //}

  //TODO: person.serialize(); //returns a serialized model (using the serialization handlers)
  serialize() {
    var self = this;

    var fields = this.fields;
    var serializationHandlers = this.serializationHandlers || {};

    var identity = function (value) {
      return value;
    };

    var serialized = {};

    Object.keys(fields).forEach(function (key) {
      if (self[key]) {
        var hander = serializationHandlers[key] || identity;
        serialized[key] = hander(self[key]);
      }
    });

    return serialized;
  }

  //TODO: person.digest() //Triggers all digest listeners (computed values etc.)
  //the digest is supposed to make the model kick of an array of listeners.
  //Listeners may be validators and computed values for instance.
  //It is basically to be able to calculate different values at a given rate.
  //For example you have a $digest() in angular also that calls all watchers
  //to do different stuff on scope and trigger DOM events and changes based on the scopes data
  //digest = "eat all properties, and update your state accordingly"

  digest() {
    var self = this;
    var computed = this.computedValues;

    if (computed) {
      Object.keys(computed).forEach(function (key) {
        var prop = {};
        var value = computed[key](self) || '';

        prop[key] = value;
        self.set(prop);
      });
    }
  }

  set(data) {
    if (!data) {
      return;
    }

    var self = this;

    Object.keys(data).forEach(function (key) {
      //Don't allow overwriting interface methods and private variables (set, remove, ...)
      //TODO: Only set actual properties
      self[key] = data[key];
    });
  }
}
