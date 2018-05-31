from mock import patch, MagicMock


class TestConfig:
    def setup(self):
        pass
        # setup() before each test method

    def teardown(self):
        pass
        # teardown() after each test method

    @classmethod
    def setup_class(cls):
        pass
        # setup_class() before any methods in this class

    @classmethod
    def teardown_class(cls):
        pass
        # teardown_class() after any methods in this class

    def test_ip1(self):
        with patch('IPython.get_ipython') as m:
            m.return_value = None
            from nannotate.utils import in_ipynb
            assert in_ipynb() == False

    def test_ip2(self):

        with patch('IPython.get_ipython') as m:
            m.return_value = MagicMock()
            from nannotate.utils import in_ipynb
            m.return_value.config = {'IPKernelApp': False}
            assert in_ipynb() == False

    def test_ip3(self):

        with patch('IPython.get_ipython') as m:
            m.return_value = MagicMock()
            m.return_value.config = {'IPKernelApp': True}

            from nannotate.utils import in_ipynb
            assert in_ipynb() == True

    def test_ip4(self):
        import sys
        del sys.modules['IPython']
        from nannotate.utils import in_ipynb
        assert in_ipynb() == False
