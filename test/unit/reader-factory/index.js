'use strict';

const ReaderFactory = require('lib/reader-factory');
const TextReader = require('lib/reader-factory/text-reader');
const DocReader = require('lib/reader-factory/doc-reader');
const PdfReader = require('lib/reader-factory/pdf-reader');

describe('reader-factory', () => {
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.spy(TextReader, 'create');
        sandbox.spy(DocReader, 'create');
        sandbox.spy(PdfReader, 'create');
    });

    afterEach(() => sandbox.restore());

    it('should choose DocReader for .doc files', () => {
        ReaderFactory.create('path/file.doc');

        assert.calledOnceWith(DocReader.create, 'path/file.doc');
    });

    it('should choose DocReader for .docx files', () => {
        ReaderFactory.create('path/file.docx');

        assert.calledOnceWith(DocReader.create, 'path/file.docx');
    });

    it('should choose PdfReader for .pdf files', () => {
        ReaderFactory.create('path/file.pdf');

        assert.calledOnceWith(PdfReader.create, 'path/file.pdf');
    });

    it('should choose TextReader for .txt files', () => {
        ReaderFactory.create('path/file.txt');

        assert.calledOnceWith(TextReader.create, 'path/file.txt');
    });
});
