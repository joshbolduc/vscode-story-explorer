import { Component } from 'react';

export default {
  title: 'Example/Decorators',
};

function Decorator(target: typeof Component) {
  return class extends target {
    render() {
      return 'Decorated message';
    }
  };
}

function DecoratorWithArgs({ message }: { message: string }) {
  return (target: typeof Component) =>
    class extends target {
      render() {
        return `Decorated message: ${message}`;
      }
    };
}

@Decorator
class TestComponent extends Component {}

@DecoratorWithArgs({
  message: 'parameterized message',
})
class TestComponentWithArgs extends Component {}

export const DecoratedClass = () => <TestComponent />;

export const DecoratedClassWithArgs = () => <TestComponentWithArgs />;
