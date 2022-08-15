import { screen } from '@testing-library/dom';
import { bills } from '../fixtures/bills.js';
import BillsUI from '../views/BillsUI.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import userEvent from '@testing-library/user-event';

describe('Given I am connected as an employee', () => {
  // test : loading page on BillUI
  test('Then, Loading page should be rendered', () => {
    const html = BillsUI({ loading: true });
    document.body.innerHTML = html;

    expect(screen.getAllByText('Loading...')).toBeTruthy();
  });

  // test : Error on bills page
  describe('When I am on Bills page and back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      document.body.innerHTML = BillsUI({ error: 'some error message' });

      expect(screen.getAllByText('Erreur')).toBeTruthy();
    });
  });

  // test : vertical icon visible in vertical layout
  describe('When I am on Bills page', () => {
    test('Then bill icon in vertical layout should be visible', () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
          })
      );

      document.body.innerHTML = BillsUI({ data: [] });

      const billIcon = screen.getByTestId('icon-window');

      expect(billIcon).toBeTruthy();
    });
  });

  // test : empty table if no bill
  describe('When I am on Bills Page and there are no bill', () => {
    test('Then bills should render an empty table', () => {
      document.body.innerHTML = BillsUI({ data: [] });

      const table = screen.queryByTestId('table');
      const eyeIcon = screen.queryByTestId('icon-eye');

      expect(table.innerHTML).toBe('');
      expect(eyeIcon).toBeNull();
    });
  });

  // test : redirected on newBill page if clic on new bill button
  describe('When I am on Bills page and I click on the new bill button', () => {
    test('Then I should be sent to newBill page', () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
          })
      );

      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;


      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const firestore = null;

      const billsContainer = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill);
      const newBillButton = screen.getByTestId('btn-new-bill');
      newBillButton.addEventListener('click', handleClickNewBill);
      userEvent.click(newBillButton);

      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
    });
  });

  describe('When I am on Bills page and I click on an icon eye', () => {
    test('Then a modal should open', () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
          })
      );

      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;


      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const firestore = null;

      const billsContainer = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      const iconEye = screen.getByTestId('icon-eye47qAXb6fIm2zOKkLzMro');
      const handleClickIconEye = jest.fn(
          billsContainer.handleClickIconEye(iconEye)
      );
      iconEye.addEventListener('click', handleClickIconEye);
      userEvent.click(iconEye);

      expect(handleClickIconEye).toHaveBeenCalled();

      const modale = screen.getByTestId('modaleFile');

      expect(modale).toBeTruthy();
    });
  });

  // test : bills ordered from earliest to latest
  describe('When I am on Bills Page and there are bill(s)', () => {
    test('Then bills should be ordered from earliest to latest', () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      const frenchMonths = [];
      for (let i = 0; i < 12; i++) {
        frenchMonths.push(
            new Intl.DateTimeFormat('fr', { month: 'short' }).format(
                new Date(2000, i)
            )
        );
      }

      // reverse Us date (year, month, day) into Fr date (day, month, year)
      const formatDateReverse = (formatedDate) => {
        let [day, month, year] = formatedDate.split(' ');
        day = parseInt(day);
        month = frenchMonths.findIndex(
            (element) => element === month.toLowerCase()
        );
        year =
            parseInt(year) < 70 ? 2000 + parseInt(year) : 1900 + parseInt(year); //arbitrary range for year : 1970-2069
        return new Date(year, month, day);
      };

      document.body.innerHTML = BillsUI({ data: billsSample });

      const dates = Array.from(
          document.body.querySelectorAll('#data-table tbody>tr>td:nth-child(3)')
      ).map((a) => a.innerHTML);

      const antiChronoSort = (a, b) =>
          formatDateReverse(a) < formatDateReverse(b) ? 1 : -1;
      const datesSorted = [...dates].sort(antiChronoSort);

      expect(dates).toEqual(datesSorted);
    });
  });
});
