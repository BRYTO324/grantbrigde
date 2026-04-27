from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.projects.models import Project, ProjectStatus
from apps.funding.models import Transaction, TransactionStatus
from apps.funding.services import _calculate_amounts
from decimal import Decimal

User = get_user_model()


class CommissionCalculationTest(TestCase):
    def test_commission_split(self):
        gross, commission, net = _calculate_amounts(Decimal("10000"))
        self.assertEqual(gross + Decimal("0"), Decimal("10000"))
        self.assertEqual(commission + net, gross)
        self.assertGreater(commission, 0)
        self.assertGreater(net, 0)

    def test_net_less_than_gross(self):
        gross, commission, net = _calculate_amounts(Decimal("5000"))
        self.assertLess(net, gross)
