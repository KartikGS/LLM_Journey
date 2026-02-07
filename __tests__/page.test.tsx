import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('Home Page', () => {
    it('renders the heading', () => {
        render(<Home />)
        const heading = screen.getByRole('heading', { level: 1, name: /LLM Journey/i })
        expect(heading).toBeInTheDocument()
    })

    it('renders the start journey link', () => {
        render(<Home />)
        const link = screen.getByRole('link', { name: /^Start Your Journey/i })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/foundations/transformers')
    })
})
