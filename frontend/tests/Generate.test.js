import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import Upload from '../src/components/Upload';
describe('Upload component', () => {
    it('renders input', () => {
        render(_jsx(Upload, { onChange: () => { } }));
        expect(screen.getByLabelText(/upload image/i)).toBeInTheDocument();
    });
});
