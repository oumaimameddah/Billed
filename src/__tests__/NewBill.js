import { fireEvent, screen } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import '@testing-library/jest-dom';
import { localStorageMock } from '../__mocks__/localStorage';
import firestore from '../app/Firestore.js';
import { ROUTES } from '../constants/routes';

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

  describe('When I am on NewBill Page', () => {
    // TEST : display newBill page
    test('Then the newBill page should be rendered', () => {
      // DOM construction
      document.body.innerHTML = NewBillUI();

      // expected result
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
    });

    // TEST : display 9 fields form
    test('Then a form with nine fields should be rendered', () => {
      // DOM construction
      document.body.innerHTML = NewBillUI();

      // get DOM element
      const form = document.querySelector('form');

      // expected result
      expect(form.length).toEqual(9);
    });
  });

  describe('When I am on NewBill Page and I add an attached file', () => {
    // TEST : handle attached file format
    test('Then the file handler should be run', () => {
      // DOM construction
      document.body.innerHTML = NewBillUI();

      // init onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // get DOM element
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: firestore,
        localStorage: window.localStorage,
      });

      // handle event
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      const attachedFile = screen.getByTestId('file');
      attachedFile.addEventListener('change', handleChangeFile);
      fireEvent.change(attachedFile, {
        target: {
          files: [new File(['file.txt'], 'file.txt', { type: 'text/txt' })],
        },
      });

      // expected result
      const numberOfFile = screen.getByTestId('file').files.length;
      expect(numberOfFile).toEqual(1);
    });
  });

  describe('WHEN I am on NewBill page and I submit a correct form', () => {
    // TEST : submit correct form and attached file
    test('THEN I should be redirected to Bills page', () => {
      // init onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // DOM construction
      document.body.innerHTML = NewBillUI();

      // get DOM element
      const newBillContainer = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });

      // handle event submit attached file
      const handleSubmit = jest.fn(newBillContainer.handleSubmit);
      newBillContainer.fileName = 'image.jpg';

      // handle event submit form
      const newBillForm = screen.getByTestId('form-new-bill');
      newBillForm.addEventListener('submit', handleSubmit);
      fireEvent.submit(newBillForm);

      // expected results
      expect(handleSubmit).toHaveBeenCalled();
      expect(screen.getAllByText('Mes notes de frais')).toBeTruthy();
    });
  });

  describe('When I am on NewBill page and I submit a wrong attached file format', () => {
    // TEST : wrong attached file format
    test('Then the error message should be displayed', () => {});

    // init onNavigate
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    // DOM construction
    document.body.innerHTML = NewBillUI();

    // get DOM element
    const newBillContainer = new NewBill({
      document,
      onNavigate,
      firestore: null,
      localStorage: window.localStorage,
    });

    const handleChangeFile = jest.fn(newBillContainer.handleChangeFile);

    const attachedFile = screen.getByTestId('file');
    attachedFile.addEventListener('change', handleChangeFile);
    fireEvent.change(attachedFile, {
      target: {
        files: [
          new File(['document.pdf'], 'document.pdf', {
            type: 'application/pdf',
          }),
        ],
      },
    });

    // expected results
    expect(handleChangeFile).toHaveBeenCalled();
    expect(attachedFile.files[0].name).toBe('document.pdf');

    // get DOM element
    const errorMessage = screen.getByTestId('fileFormat-errorMessage');

    // expected results
    expect(errorMessage.textContent).toEqual(
        expect.stringContaining('Votre justificatif doit être une image de format (.jpg) ou (.jpeg) ou (.png)')
    );
  });
});
