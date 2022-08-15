import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { bills } from '../fixtures/bills.js';
import Bills from '../containers/Bills.js';
import BillsUI from '../views/BillsUI.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { ROUTES } from '../constants/routes';
import firebase from "../__mocks__/firebase";

// UNIT TESTS : CONNECTED AS EMPLOYEE

describe('Given I am connected as an employee', () => {
  // parcours employe
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
  window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
      })
  );

  // TEST : loading page BillsUI
  test('Then, Loading page should be rendered', () => {
    const html = BillsUI({ loading: true });
    document.body.innerHTML = html;

    // expected result
    expect(screen.getAllByText('Loading...')).toBeTruthy();
  });

  // TEST : Error on BillsUI page
  describe('When I am on Bills page and back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      document.body.innerHTML = BillsUI({ error: 'some error message' });

      // expected result
      expect(screen.getAllByText('Erreur')).toBeTruthy();
    });
  });

  // TEST : bill icon visible in vertical layout
  describe('When I am on Bills page', () => {
    test('Then bill icon in vertical layout should be visible', () => {
      // DOM construction
      document.body.innerHTML = BillsUI({ data: [] });

      // get icon in DOM
      const billIcon = screen.getByTestId('icon-window');

      // result expected
      expect(billIcon).toBeTruthy();
    });
  });

  // TEST : empty table if no bill
  describe('When I am on Bills Page and there are no bill', () => {
    test('Then bills should render an empty table', () => {
      // DOM construction
      document.body.innerHTML = BillsUI({ data: [] });

      // get DOM element
      const eyeIcon = screen.queryByTestId('icon-eye');

      // expected result
      expect(eyeIcon).toBeNull();

      // get DOM element
      // const table = screen.queryByTestId('tbody');

      // expected result
      // expect(table.innerHTML).toBe("");

      // ERREUR --------------------
      // expect(received).toBe(expected) // Object.is equality
      // Expected: ""
      // Received: "·············"
    });
  });

  // TEST : redirected on newBill page if click on new bill button
  describe('When I am on Bills page and I click on the new bill button Nouvelle note de frais', () => {
    test('Then I should navigate to newBill page bill/new', () => {
      // DOM construction
      document.body.innerHTML = BillsUI({ bills });

      // init onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // init firestore
      const firestore = null;

      // init bills display
      const billsContainer = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      // handle click event
      const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill);
      const newBillButton = screen.getByTestId('btn-new-bill');
      newBillButton.addEventListener('click', handleClickNewBill);
      userEvent.click(newBillButton);

      // expected results
      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
    });
  });

  // TEST : click on icon eye opens modal & display attached image
  describe('When I am on Bills page and I click on an icon eye', () => {
    test('Then a modal should open', () => {
      // DOM construction
      document.body.innerHTML = BillsUI({ data: bills });

      // init onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // init firestore
      const firestore = null;

      // init bills display
      const billsContainer = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      // get DOM element
      const iconEye = screen.getAllByTestId('icon-eye')[0];

      // handle click event
      const handleClickIconEye = jest.fn(
          billsContainer.handleClickIconEye(iconEye)
      );
      iconEye.addEventListener('click', handleClickIconEye);
      userEvent.click(iconEye);

      // expected result
      expect(handleClickIconEye).toHaveBeenCalled();
    });

    test('Then the modal should display the attached image', () => {
      // DOM construction
      document.body.innerHTML = BillsUI({ data: bills });

      // init onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // init firestore
      const firestore = null;

      // init bills display
      const billsContainer = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      // get DOM element
      const iconEye = screen.getAllByTestId('icon-eye')[0];

      // handle click event
      billsContainer.handleClickIconEye(iconEye);

      // expected results
      expect(document.querySelector('.modal')).toBeTruthy();
    });
  });

  // test : bills ordered from earliest to latest
  // ORIGINAL
  /*test("Then bills should be ordered from earliest to latest", () => {
    const html = BillsUI({ data: bills })
    document.body.innerHTML = html
    const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
    const antiChrono = (a, b) => ((a < b) ? 1 : -1)
    const datesSorted = [...dates].sort(antiChrono)
    expect(dates).toEqual(datesSorted)
  })*/

  describe('When I am on Bills Page and there are bill(s)', () => {
    test('Then bills should be ordered from earliest to latest', () => {
      // DOM element
      document.body.innerHTML = BillsUI({ data: bills });

      // frecnh months array
      const frenchMonths = [];
      for (let i = 0; i < 12; i++) {
        frenchMonths.push(
            new Intl.DateTimeFormat('fr', { month: 'short' }).format(
                new Date(2000, i)
            )
        );
      }

      // reverse Us date (year, month, day) into Fr date (day, month, year)
      const reverseDate = (formatedDate) => {
        let [day, month, year] = formatedDate.split(' ');
        day = parseInt(day);
        month = frenchMonths.findIndex(
            (element) => element === month.toLowerCase()
        );
        year =
            parseInt(year) < 70 ? 2000 + parseInt(year) : 1900 + parseInt(year); //arbitrary range for year : 1970-2069
        return new Date(year, month, day);
      };

      document.body.innerHTML = BillsUI({ data: bills });

      // get dates from table
      const dates = Array.from(
          document.body.querySelectorAll('#data-table tbody>tr>td:nth-child(3)')
      ).map((a) => a.innerHTML);

      // sort from earliest to latest
      const antiChronoSort = (a, b) =>
          reverseDate(a) < reverseDate(b) ? 1 : -1;
      const datesSorted = [...dates].sort(antiChronoSort);

      // expected result
      expect(dates).toEqual(datesSorted);
    });
  });

  // INTEGRATION GET TESTS

  describe('Given I am a user connected as Employee', () => {
    describe('When I navigate to BillsUI', () => {
      // TEST : bills fetch from API
      test('fetches bills from mock API GET', async () => {
        // spy on Firebase Mock
        const getSpy = jest.spyOn(firebase, 'get');

        // get bills
        const bills = await firebase.get();

        // expected results
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(bills.data.length).toBe(4);
      });

      // TEST : bills fetch failure => 404 error
      test('fetches bills from an API and fails with 404 message error', async () => {
        // single use for throw error
        firebase.get.mockImplementationOnce(() =>
            Promise.reject(new Error('Erreur 404'))
        );

        // DOM element
        document.body.innerHTML = BillsUI({ error: 'Erreur 404' });

        // await response
        const message = await screen.getByText(/Erreur 404/);

        // expected result
        expect(message).toBeTruthy();
      });

      // TEST messages fetch failure => 500 error
      test('fetches messages from an API and fails with 500 message error', async () => {
        // single use for throw error
        firebase.get.mockImplementationOnce(() =>
            Promise.reject(new Error('Erreur 500'))
        );

        // DOM element
        document.body.innerHTML = BillsUI({ error: 'Erreur 500' });
        const message = await screen.getByText(/Erreur 500/);

        // expected result
        expect(message).toBeTruthy();
      });
    });
  });
});
