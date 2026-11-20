import {
  test as base,
  expect,
  type ConsoleMessage,
  type Dialog,
  type Response,
} from '@playwright/test';

type BrowserEvent = {
  timestamp: string;
  message: string;
};

type BrowserTelemetry = {
  pageErrors: BrowserEvent[];
  dialogs: (BrowserEvent & { type: string })[];
  consoleErrors: (BrowserEvent & { location: ReturnType<ConsoleMessage['location']> })[];
  httpErrors: { timestamp: string; url: string; status: number }[];
  dialogHandlerErrors: BrowserEvent[];
};

// Automatic so monitoring is active even if the test only requests `page`.
export const test = base.extend<{ telemetry: BrowserTelemetry }>({
  telemetry: [async ({ page }, use, testInfo) => {
    const events: BrowserTelemetry = {
      pageErrors: [],
      dialogs: [],
      consoleErrors: [],
      httpErrors: [],
      dialogHandlerErrors: [],
    };
    const entry = (message: string): BrowserEvent => ({
      timestamp: new Date().toISOString(),
      message,
    });
    const onPageError = (error: Error) => events.pageErrors.push(entry(error.message));
    const onConsole = (message: ConsoleMessage) => {
      if (message.type() === 'error') {
        events.consoleErrors.push({ ...entry(message.text()), location: message.location() });
      }
    };
    const onResponse = (response: Response) => {
      if (response.status() >= 400) {
        const url = new URL(response.url());
        events.httpErrors.push({
          timestamp: new Date().toISOString(),
          url: `${url.origin}${url.pathname}`,
          status: response.status(),
        });
      }
    };
    const onDialog = async (dialog: Dialog) => {
      events.dialogs.push({ ...entry(dialog.message()), type: dialog.type() });
      try {
        await dialog.dismiss();
      } catch (error) {
        events.dialogHandlerErrors.push(entry(String(error)));
      }
    };

    page.on('pageerror', onPageError);
    page.on('console', onConsole);
    page.on('dialog', onDialog);
    page.on('response', onResponse);

    try {
      await use(events);
    } finally {
      page.off('pageerror', onPageError);
      page.off('console', onConsole);
      page.off('dialog', onDialog);
      page.off('response', onResponse);
      await testInfo.attach('browser-telemetry.json', {
        body: JSON.stringify(events, null, 2),
        contentType: 'application/json',
      });
    }

    expect.soft(events.pageErrors, 'No uncaught application errors').toEqual([]);
    expect.soft(events.dialogs, 'No unexpected native browser dialogs').toEqual([]);
    expect.soft(events.dialogHandlerErrors, 'Dialog handling succeeds').toEqual([]);
    // Console errors remain evidence to investigate, rather than being silently
    // discarded or automatically equated with an application exception.
  }, { auto: true }],
});

export { expect };
