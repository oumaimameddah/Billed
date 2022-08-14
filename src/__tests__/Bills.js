import { screen } from '@testing-library/dom';
import { bills } from '../fixtures/bills.js';
import BillsUI from '../views/BillsUI.js';

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page and there are no bill', () => {
    test('Then bills should be empty', () => {
      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;
      //to-do write expect expression // DONE
      const eyeIconElt = screen.queryByTestId('icon-eye');
      expect(eyeIconElt).toBeNull();
    });
  });

  describe('When I am on Bills Page and there are bill(s)', () => {
    test('Then bills should be ordered from earliest to latest', () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      // recupere les dates
      const dates = Array.from(
          document.body.querySelectorAll('#data-table tbody>tr>td:nth-child(3)')
      ).map((a) => a.innerHTML);

      console.log(dates);

      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      console.log(datesSorted);

      expect(dates).toEqual(datesSorted);
    });
  });
});
