const app = document.getElementById('app')!;
const projectInputTemplate = document.querySelector('#project-input')! as HTMLTemplateElement;
const projectTemplate = document.querySelector('#single-project')! as HTMLTemplateElement;
const projectListTemplate = document.querySelector('#project-list')! as HTMLTemplateElement;

const projectTemplateNode = projectInputTemplate.content.cloneNode(true);
const projectListNode = projectListTemplate.content.cloneNode(true);
app.appendChild(projectTemplateNode);
app.appendChild(projectListNode);

const h2 = document.querySelector('h2')! as HTMLHeadingElement;
const ul = document.querySelector('ul')!;
const form = document.querySelector('form')!;
const title = document.querySelector('#title')! as HTMLInputElement;
const description = document.querySelector('#description')! as HTMLTextAreaElement;
const people = document.querySelector('#people')! as HTMLInputElement;

h2.textContent = 'Project List';

type ValidationStoreForClass<T> = {
  [key in keyof T]: string[];
};
type ValidationStore = {
  [x: string]: ValidationStoreForClass<any>;
};
const validationStore: ValidationStore = {};

interface Classable {
  constructor: {
    name: string;
  };
}

const RequiredLength = <T extends Classable>() => {
  return (target: T, propertyKey: keyof T) => {
    validationStore[target.constructor.name] = validationStore[target.constructor.name] || {};
    const validationStoreForClass: ValidationStoreForClass<T> = validationStore[target.constructor.name];
    const validationStoreForField = validationStoreForClass[propertyKey] || [];
    validationStoreForClass[propertyKey] = [...validationStoreForField, 'requiredLength'];
  };
};

const PositiveNumber = <T extends Classable>() => {
  return (target: T, propertyKey: keyof T) => {
    validationStore[target.constructor.name] = validationStore[target.constructor.name] || {};
    const validationStoreForClass: ValidationStoreForClass<T> = validationStore[target.constructor.name];
    const validationStoreForField = validationStoreForClass[propertyKey] || [];
    validationStoreForClass[propertyKey] = [...validationStoreForField, 'positiveNumber'];
  };
};

const validateField = (field: string | number, validations: string[]) => {
  let valid = true;
  return validations?.every((validation) => {
    switch (validation) {
      case 'requiredLength':
        valid = field.toString().length > 0;
        break;
      case 'positiveNumber':
        valid = +field > 0;
        break;
    }
    return valid;
  });
};

const hasValidFields = <T extends Classable>(instance: T) => {
  const validationStoreForClass = validationStore[instance.constructor.name];
  return Object.keys(validationStoreForClass).every((key) => {
    const validations = validationStoreForClass[key];
    const field = instance[key as keyof T];
    let passedValidation = true;
    if (typeof field == 'number' || typeof field == 'string') {
      passedValidation = validateField(field, validations);
    }
    return passedValidation;
  });
};

class Project {
  @RequiredLength<Project>()
  title: string;
  @RequiredLength<Project>()
  description: string;
  @PositiveNumber<Project>()
  people: number;

  constructor(title: string, description: string, people: number) {
    this.title = title;
    this.description = description;
    this.people = people;
  }

  print() {
    const { title, description, people } = this;
    return `${title}, ${description}, ${people}`;
  }
}

const appendProjectToList = (project: Project) => {
  const projectNode = projectTemplate.content.cloneNode(true) as HTMLElement;
  const li = projectNode.querySelector('li')!;
  li.textContent = project.print();
  ul.appendChild(projectNode);
};

const clearForm = () => {
  title.value = '';
  description.value = '';
  people.value = '';
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const project = new Project(title.value.trim(), description.value.trim(), +people.value.trim());
  if (!hasValidFields(project)) {
    alert('Not valid input!');
    return;
  }

  appendProjectToList(project);
  clearForm();
});
