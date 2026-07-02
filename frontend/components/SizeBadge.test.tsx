import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

import SizeBadge from '@/components/SizeBadge';
import { FieldSize } from '@/lib/types';

const messages = {
  sizeBadge: {
    five: '5 jugadores',
    seven: '7 jugadores',
    eleven: '11 jugadores',
  },
};

function renderWithIntl(size: FieldSize) {
  return render(
    <NextIntlClientProvider locale="es" messages={messages}>
      <SizeBadge size={size} />
    </NextIntlClientProvider>,
  );
}

describe('SizeBadge', () => {
  it('renders the "5 jugadores" label for FieldSize.Five', () => {
    renderWithIntl(FieldSize.Five);
    expect(screen.getByText('5 jugadores')).toBeInTheDocument();
  });

  it('renders the "7 jugadores" label for FieldSize.Seven', () => {
    renderWithIntl(FieldSize.Seven);
    expect(screen.getByText('7 jugadores')).toBeInTheDocument();
  });

  it('renders the "11 jugadores" label for FieldSize.Eleven', () => {
    renderWithIntl(FieldSize.Eleven);
    expect(screen.getByText('11 jugadores')).toBeInTheDocument();
  });
});
