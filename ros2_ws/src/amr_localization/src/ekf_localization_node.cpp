#include <rclcpp/rclcpp.hpp>
#include <nav_msgs/msg/odometry.hpp>
#include <sensor_msgs/msg/imu.hpp>
#include <geometry_msgs/msg/transform_stamped.hpp>
#include <tf2_ros/transform_broadcaster.h>
#include <cmath>
#include <vector>

class EKFLocalizationNodeCPP : public rclcpp::Node {
public:
    EKFLocalizationNodeCPP() : Node("ekf_localization_node_cpp") {
        this->declare_parameter("process_noise_std", 0.05);
        this->declare_parameter("odom_noise_std", 0.15);
        this->declare_parameter("imu_noise_std", 0.02);

        x_ = {0.0, 0.0, 0.0, 0.0, 0.0, 0.0};
        
        odom_sub_ = this->create_subscription<nav_msgs::msg::Odometry>(
            "/odom", 10, std::bind(&EKFLocalizationNodeCPP::odomCallback, this, std::placeholders::_1));
        imu_sub_ = this->create_subscription<sensor_msgs::msg::Imu>(
            "/imu", 10, std::bind(&EKFLocalizationNodeCPP::imuCallback, this, std::placeholders::_1));

        filtered_pub_ = this->create_publisher<nav_msgs::msg::Odometry>("/odometry/filtered", 10);
        tf_broadcaster_ = std::make_unique<tf2_ros::TransformBroadcaster>(*this);

        RCLCPP_INFO(this->get_logger(), "C++ EKF Localization Node initialized.");
    }

private:
    void odomCallback(const nav_msgs::msg::Odometry::SharedPtr msg) {
        x_[0] = msg->pose.pose.position.x;
        x_[1] = msg->pose.pose.position.y;
        
        auto q = msg->pose.pose.orientation;
        double siny_cosp = 2.0 * (q.w * q.z + q.x * q.y);
        double cosy_cosp = 1.0 - 2.0 * (q.y * q.y + q.z * q.z);
        x_[2] = std::atan2(siny_cosp, cosy_cosp);

        x_[3] = msg->twist.twist.linear.x;
        x_[4] = msg->twist.twist.linear.y;
        x_[5] = msg->twist.twist.angular.z;

        publishFiltered(msg->header.stamp);
    }

    void imuCallback(const sensor_msgs::msg::Imu::SharedPtr msg) {
        x_[5] = msg->angular_velocity.z;
    }

    void publishFiltered(const rclcpp::Time & stamp) {
        nav_msgs::msg::Odometry out;
        out.header.stamp = stamp;
        out.header.frame_id = "odom";
        out.child_frame_id = "base_link";
        out.pose.pose.position.x = x_[0];
        out.pose.pose.position.y = x_[1];
        out.pose.pose.orientation.z = std::sin(x_[2] / 2.0);
        out.pose.pose.orientation.w = std::cos(x_[2] / 2.0);
        out.twist.twist.linear.x = x_[3];
        out.twist.twist.linear.y = x_[4];
        out.twist.twist.angular.z = x_[5];
        filtered_pub_->publish(out);

        geometry_msgs::msg::TransformStamped t;
        t.header.stamp = stamp;
        t.header.frame_id = "odom";
        t.child_frame_id = "base_link";
        t.transform.translation.x = x_[0];
        t.transform.translation.y = x_[1];
        t.transform.rotation.z = std::sin(x_[2] / 2.0);
        t.transform.rotation.w = std::cos(x_[2] / 2.0);
        tf_broadcaster_->sendTransform(t);
    }

    std::vector<double> x_;
    rclcpp::Subscription<nav_msgs::msg::Odometry>::SharedPtr odom_sub_;
    rclcpp::Subscription<sensor_msgs::msg::Imu>::SharedPtr imu_sub_;
    rclcpp::Publisher<nav_msgs::msg::Odometry>::SharedPtr filtered_pub_;
    std::unique_ptr<tf2_ros::TransformBroadcaster> tf_broadcaster_;
};

int main(int argc, char ** argv) {
    rclcpp::init(argc, argv);
    rclcpp::spin(std::make_shared<EKFLocalizationNodeCPP>());
    rclcpp::shutdown();
    return 0;
}
