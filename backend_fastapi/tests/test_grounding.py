import unittest
import sys
import os

# Adjust path to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend_fastapi.app.services.query_classifier import QueryClassifier
from backend_fastapi.app.services.vector_store import VectorStore
from backend_fastapi.app.services.llm import LLMService

class TestRoboticsGrounding(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.classifier = QueryClassifier()
        cls.vector_store = VectorStore()
        cls.llm_service = LLMService()

    def test_agro_r1_query_grounding(self):
        # TEST 1: "What is AGRO-R1?"
        query = "What is AGRO-R1?"
        classification = self.classifier.classify(query)
        
        # Check intent classification
        self.assertEqual(classification["intent"], "SPECIFIC_ROBOT_MODEL")
        
        # Check source selection and relevance
        sources = self.vector_store.search(query, intent=classification["intent"], top_k=3)
        self.assertTrue(len(sources) > 0)
        self.assertEqual(sources[0]["id"], "agro_r1_spec_1")
        self.assertEqual(sources[0]["entity_id"], "AGRO-R1")
        self.assertEqual(sources[0]["image_url"], "/images/robots/agro-r1.webp")

    def test_show_agro_r1_query(self):
        # TEST 2: "Show AGRO-R1"
        query = "Show AGRO-R1"
        classification = self.classifier.classify(query)
        sources = self.vector_store.search(query, intent=classification["intent"], top_k=3)
        
        # Check that specific AGRO-R1 robot specification is retrieved
        self.assertTrue(any(s.get("entity_id") == "AGRO-R1" for s in sources))

    def test_general_robotics_query(self):
        # TEST 3: "What is a robot?"
        query = "What is a robot?"
        classification = self.classifier.classify(query)
        
        # Verify general intent
        self.assertEqual(classification["intent"], "GENERAL_ROBOTICS")
        
        # Verify that AGRO-R1 specific specifications are NOT retrieved
        sources = self.vector_store.search(query, intent=classification["intent"], top_k=3)
        self.assertTrue(len(sources) > 0)
        self.assertNotEqual(sources[0]["id"], "agro_r1_spec_1")
        self.assertIsNone(sources[0].get("entity_id"))

    def test_qos_query(self):
        # TEST 4: "What is BEST_EFFORT QoS?"
        query = "What is BEST_EFFORT QoS?"
        classification = self.classifier.classify(query)
        
        # Verify ROS 2 QoS intent
        self.assertEqual(classification["intent"], "ROS2_QOS")
        
        # Verify that AGRO-R1 specifications are NOT retrieved
        sources = self.vector_store.search(query, intent=classification["intent"], top_k=3)
        self.assertTrue(len(sources) > 0)
        self.assertNotEqual(sources[0]["id"], "agro_r1_spec_1")
        self.assertIsNone(sources[0].get("entity_id"))

if __name__ == "__main__":
    unittest.main()
