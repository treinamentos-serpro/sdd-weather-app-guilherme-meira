import { expect, test } from '@playwright/test';

test('busca uma cidade, mostra a previsão e alterna para Fahrenheit', async ({ page }) => {
  await page.route('**/v1/search**', async (route) => {
    await route.fulfill({
      json: {
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            latitude: -23.5475,
            longitude: -46.6361,
            country: 'Brasil',
            admin1: 'São Paulo',
            timezone: 'America/Sao_Paulo',
          },
        ],
      },
    });
  });

  await page.route('**/v1/forecast**', async (route) => {
    await route.fulfill({
      json: {
        timezone: 'America/Sao_Paulo',
        current: {
          time: '2026-10-27T14:00',
          temperature_2m: 0,
          weather_code: 0,
          relative_humidity_2m: 55,
          wind_speed_10m: 8.5,
          precipitation: 0,
          pressure_msl: 1013,
        },
        daily: {
          time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
          weather_code: [0, 1, 2, 3, 61],
          temperature_2m_min: [0, 1, 2, 3, 4],
          temperature_2m_max: [10, 11, 12, 13, 14],
          precipitation_probability_max: [0, 10, 20, 30, 80],
        },
      },
    });
  });

  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  const currentWeather = page.getByRole('region', { name: 'Clima atual' });
  await expect(currentWeather.getByText('0,0 °C')).toBeVisible();

  await page.getByRole('button', { name: 'Fahrenheit' }).click();

  await expect(currentWeather.getByText('32,0 °F')).toBeVisible();
});

test('mostra estado vazio quando o geocoding não retorna results', async ({ page }) => {
  await page.route('**/v1/search**', async (route) => {
    await route.fulfill({ json: {} });
  });

  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('Cidade sem resultados');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
});

test('renderiza o clima corretamente em viewport mobile de 375x812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route('**/v1/search**', async (route) => {
    await route.fulfill({
      json: {
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            latitude: -23.5475,
            longitude: -46.6361,
            country: 'Brasil',
            admin1: 'São Paulo',
            timezone: 'America/Sao_Paulo',
          },
        ],
      },
    });
  });
  await page.route('**/v1/forecast**', async (route) => {
    await route.fulfill({
      json: {
        timezone: 'America/Sao_Paulo',
        current: {
          time: '2026-10-27T14:00',
          temperature_2m: 0,
          weather_code: 0,
          relative_humidity_2m: 55,
          wind_speed_10m: 8.5,
          precipitation: 0,
          pressure_msl: 1013,
        },
        daily: {
          time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
          weather_code: [0, 1, 2, 3, 61],
          temperature_2m_min: [0, 1, 2, 3, 4],
          temperature_2m_max: [10, 11, 12, 13, 14],
          precipitation_probability_max: [0, 10, 20, 30, 80],
        },
      },
    });
  });

  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Clima atual' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Clima atual' }).getByText('0,0 °C')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(375);
});

for (const cityName of ["O'Fallon", 'Aix-en-Provence', 'São Tomé']) {
  test(`preserva caracteres especiais na busca por ${cityName}`, async ({ page }) => {
    let requestedName: string | null = null;

    await page.route('**/v1/search**', async (route) => {
      requestedName = new URL(route.request().url()).searchParams.get('name');
      await route.fulfill({
        json: {
          results: [
            {
              id: 1,
              name: cityName,
              latitude: 10,
              longitude: 20,
              country: 'Brasil',
            },
          ],
        },
      });
    });
    await page.route('**/v1/forecast**', async (route) => {
      await route.fulfill({
        json: {
          timezone: 'America/Sao_Paulo',
          current: { time: '2026-10-27T14:00', temperature_2m: 18, weather_code: 1 },
          daily: {
            time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
            weather_code: [1, 1, 1, 1, 1],
            temperature_2m_min: [10, 10, 10, 10, 10],
            temperature_2m_max: [20, 20, 20, 20, 20],
            precipitation_probability_max: [0, 0, 0, 0, 0],
          },
        },
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Nome da cidade').fill(cityName);
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByRole('heading', { name: cityName })).toBeVisible();
    expect(requestedName).toBe(cityName);
  });
}

test('mantém o clima atual quando a resposta de forecast não tem daily', async ({ page }) => {
  await page.route('**/v1/search**', async (route) => {
    await route.fulfill({
      json: {
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            latitude: -23.5475,
            longitude: -46.6361,
            country: 'Brasil',
            admin1: 'São Paulo',
            timezone: 'America/Sao_Paulo',
          },
        ],
      },
    });
  });
  await page.route('**/v1/forecast**', async (route) => {
    await route.fulfill({
      json: {
        timezone: 'America/Sao_Paulo',
        current: { time: '2026-10-27T14:00', temperature_2m: 18.5, weather_code: null },
      },
    });
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Nome da cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const currentWeather = page.getByRole('region', { name: 'Clima atual' });
  await expect(currentWeather.getByText('18,5 °C')).toBeVisible();
  await expect(currentWeather.getByText('Condição indisponível')).toBeVisible();
  await expect(page.getByText('Previsão indisponível.')).toBeVisible();
});
