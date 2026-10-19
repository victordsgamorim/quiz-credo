# Testing Guide

This project uses **Vitest** with **React Testing Library** for component testing.

## Quick Start

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Tests are organized in `__tests__` directories alongside the components they test:

```
src/components/
├── quiz/
│   ├── __tests__/
│   │   ├── Timer.test.tsx
│   │   ├── AnswerOption.test.tsx
│   │   └── QuestionCard.test.tsx
│   ├── Timer.tsx
│   ├── AnswerOption.tsx
│   └── QuestionCard.tsx
└── lobby/
    ├── __tests__/
    │   ├── ActiveRoomCard.test.tsx
    │   └── ConnectionStatusCard.test.tsx
    ├── ActiveRoomCard.tsx
    └── ConnectionStatusCard.tsx
```

## Writing Tests

### Basic Test Template

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComponentName } from "../ComponentName";

describe("ComponentName", () => {
  it("renders correctly", () => {
    render(<ComponentName />);
    expect(screen.getByText("expected text")).toBeInTheDocument();
  });
});
```

### Testing User Interactions

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";

describe("Button", () => {
  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Mocking External Libraries

```typescript
import { vi } from "vitest";

// Mock toast notifications
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock router
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));
```

### Mocking Browser APIs

```typescript
const mockWriteText = vi.fn();

Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

it("copies to clipboard", async () => {
  mockWriteText.mockResolvedValueOnce(undefined);
  const user = userEvent.setup();

  render(<CopyButton text="Hello" />);
  await user.click(screen.getByRole("button"));

  expect(mockWriteText).toHaveBeenCalledWith("Hello");
});
```

## Common Testing Patterns

### Testing Conditional Rendering

```typescript
it("shows loading state", () => {
  render(<Component isLoading={true} />);
  expect(screen.getByText("Loading...")).toBeInTheDocument();
});

it("shows content when loaded", () => {
  render(<Component isLoading={false} />);
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  expect(screen.getByText("Content")).toBeInTheDocument();
});
```

### Testing CSS Classes

```typescript
it("applies correct variant class", () => {
  render(<Button variant="primary" />);
  const button = screen.getByRole("button");
  expect(button).toHaveClass("btn-primary");
});
```

### Testing Props

```typescript
it("displays the correct text", () => {
  render(<Component title="Test Title" />);
  expect(screen.getByText("Test Title")).toBeInTheDocument();
});
```

### Testing Lists

```typescript
it("renders all items", () => {
  const items = ["Item 1", "Item 2", "Item 3"];
  render(<List items={items} />);

  items.forEach(item => {
    expect(screen.getByText(item)).toBeInTheDocument();
  });
});
```

## Testing Checklist

When creating tests for a new component, ensure you cover:

- ✅ Basic rendering with default props
- ✅ Rendering with different prop combinations
- ✅ User interactions (clicks, typing, etc.)
- ✅ Conditional rendering
- ✅ Error states
- ✅ Loading states
- ✅ CSS classes/variants
- ✅ Accessibility (roles, labels)
- ✅ Edge cases (empty states, max values, etc.)

## Useful Testing Library Queries

### Priority Order (use in this order)

1. **Accessible queries** (preferred):
   - `getByRole` - Buttons, links, inputs, etc.
   - `getByLabelText` - Form fields
   - `getByPlaceholderText` - Inputs with placeholders
   - `getByText` - Text content
   - `getByDisplayValue` - Form inputs with values

2. **Semantic queries**:
   - `getByAltText` - Images
   - `getByTitle` - Elements with title attribute

3. **Test IDs** (last resort):
   - `getByTestId` - Use `data-testid` attribute

### Query Variants

- `getBy...` - Throws error if not found (default)
- `queryBy...` - Returns `null` if not found (for checking non-existence)
- `findBy...` - Returns a Promise (for async elements)
- `getAllBy...` - Returns array of all matches
- `queryAllBy...` - Returns empty array if none found
- `findAllBy...` - Returns Promise of array

## Examples from the Codebase

### Timer Component Test

```typescript:src/components/quiz/__tests__/Timer.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { Timer } from "../Timer";

const renderTimer = (props: Parameters<typeof Timer>[0]) =>
  render(
    <LocaleProvider>
      <Timer {...props} />
    </LocaleProvider>
  );

describe("Timer", () => {
  it("shows the time left", () => {
    renderTimer({ timeLeft: 65, progress: 50, isLowTime: false, isCriticalTime: false });
    expect(screen.getByRole("timer")).toHaveTextContent("1:05");
  });

  it("turns red when the time is almost over", () => {
    const { container } = renderTimer({
      timeLeft: 5,
      progress: 10,
      isLowTime: true,
      isCriticalTime: true,
    });
    expect(container.querySelector(".countdown")).toHaveAttribute("data-state", "critical");
  });
});
```

### Component with User Interaction

```typescript:src/components/quiz/__tests__/AnswerOption.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnswerOption } from "../AnswerOption";

describe("AnswerOption", () => {
  it("calls onSelect when clicked", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <AnswerOption
        option="Test Answer"
        index={0}
        onSelect={onSelect}
        disabled={false}
      />
    );

    await user.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(0);
  });
});
```

## Continuous Integration

Tests run automatically on every PR via GitHub Actions:

- Linting must pass
- All tests must pass
- Build must succeed

See `.github/workflows/test.yml` for the complete CI configuration.

## Troubleshooting

### "toBeInTheDocument is not a function"

Make sure you have the proper TypeScript configuration. The types are set up in:

- `src/test/vitest.d.ts`
- `tsconfig.test.json`

### Tests fail with "Cannot find module"

Check that your imports use the correct relative paths:

```typescript
// ✅ Correct (from __tests__ directory)
import { Component } from "../Component";

// ❌ Wrong
import { Component } from "./Component";
```

### Async tests timeout

Make sure to use `async/await` with `userEvent`:

```typescript
// ✅ Correct
const user = userEvent.setup();
await user.click(button);

// ❌ Wrong
userEvent.click(button);
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
