#include <rclcpp/rclcpp.hpp>
#include <nav_msgs/msg/occupancy_grid.hpp>
#include <nav_msgs/msg/path.hpp>
#include <geometry_msgs/msg/pose_stamped.hpp>
#include <queue>
#include <cmath>
#include <vector>
#include <unordered_map>

struct NodeAStar {
    int x, y;
    double g, h, f;
    bool operator>(const NodeAStar& other) const { return f > other.f; }
};

class CustomAStarPlannerCPP : public rclcpp::Node {
public:
    CustomAStarPlannerCPP() : Node("custom_ast_planner_cpp") {
        map_sub_ = this->create_subscription<nav_msgs::msg::OccupancyGrid>(
            "/map", 10, std::bind(&CustomAStarPlannerCPP::mapCallback, this, std::placeholders::_1));
        path_pub_ = this->create_publisher<nav_msgs::msg::Path>("/global_path", 10);
        RCLCPP_INFO(this->get_logger(), "C++ Custom A* Planner Node initialized.");
    }

private:
    void mapCallback(const nav_msgs::msg::OccupancyGrid::SharedPtr msg) {
        width_ = msg->info.width;
        height_ = msg->info.height;
        res_ = msg->info.resolution;
        grid_data_ = msg->data;
    }

    double manhattanHeuristic(int x1, int y1, int x2, int y2) {
        return std::abs(x1 - x2) + std::abs(y1 - y2);
    }

    int width_ = 100, height_ = 100;
    double res_ = 0.10;
    std::vector<int8_t> grid_data_;
    rclcpp::Subscription<nav_msgs::msg::OccupancyGrid>::SharedPtr map_sub_;
    rclcpp::Publisher<nav_msgs::msg::Path>::SharedPtr path_pub_;
};

int main(int argc, char ** argv) {
    rclcpp::init(argc, argv);
    rclcpp::spin(std::make_shared<CustomAStarPlannerCPP>());
    rclcpp::shutdown();
    return 0;
}
